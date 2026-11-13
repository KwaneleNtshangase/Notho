import CoreMotion
import UIKit
import Capacitor

/// Paints the window behind the WebView so the status bar and home indicator
/// match the system theme. The shipped 1.1 binary still has a white UIKit
/// gap; this lands on the next store build.
class NothoBridgeViewController: CAPBridgeViewController {
    /// Core Motion shake watch. See ShakeWatch below.
    private var shakeWatch: ShakeWatch?

    override var preferredStatusBarStyle: UIStatusBarStyle {
        traitCollection.userInterfaceStyle == .dark ? .lightContent : .darkContent
    }

    /// Require a second swipe on the home indicator before the system
    /// leaves the app. Matches the accidental-close protection in
    /// Duolingo and Clash of Clans.
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
        .bottom
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        applyChrome()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startShakeWatch()
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        shakeWatch?.stop()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        shakeWatch?.stop()
    }

    @objc private func appDidBecomeActive() {
        startShakeWatch()
    }

    @objc private func appWillResignActive() {
        shakeWatch?.stop()
    }

    private func startShakeWatch() {
        if shakeWatch == nil {
            shakeWatch = ShakeWatch { [weak self] in
                // Same event ShakeToReport already listens for on the website.
                // WKWebView never delivers this from UIKit motion events.
                self?.webView?.evaluateJavaScript(
                    "window.dispatchEvent(new Event('notho:shake'))",
                    completionHandler: nil
                )
            }
        }
        shakeWatch?.start()
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyChrome()
        setNeedsStatusBarAppearanceUpdate()
    }

    private func applyChrome() {
        let dark = traitCollection.userInterfaceStyle == .dark
        let color: UIColor = dark ? .black : .white
        view.backgroundColor = color
        webView?.isOpaque = true
        webView?.backgroundColor = color
        webView?.scrollView.backgroundColor = color
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = NothoBridgeViewController()
        window?.backgroundColor = UIColor { traits in
            traits.userInterfaceStyle == .dark ? .black : .white
        }
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// Deliberate-shake detector.
///
/// @capgo/capacitor-shake posts from `UIWindow.motionEnded`. Capacitor makes
/// the WKWebView the first responder, and UIKit delivers the shake motion
/// event only to that first responder, so the window method never runs and
/// the plugin stays silent. DeviceMotionEvent in this WKWebView is the same
/// story: iOS will not deliver it without a web permission the view does not
/// grant. Core Motion does not use the responder chain.
///
/// Thresholds match `src/lib/shakeDetect.ts` (acceleration in m/s²).
fileprivate final class ShakeWatch {
    private let manager = CMMotionManager()
    private let onShake: () -> Void
    private var last: (x: Double, y: Double, z: Double, t: TimeInterval)?
    private var hits: [TimeInterval] = []
    private var lastFire: TimeInterval = -.infinity

    private let force = 22.0
    private let sample = 0.08
    private let windowSec = 0.9
    private let hitsNeeded = 3
    private let cooldown = 2.5

    init(onShake: @escaping () -> Void) {
        self.onShake = onShake
    }

    func start() {
        guard manager.isAccelerometerAvailable, !manager.isAccelerometerActive else { return }
        manager.accelerometerUpdateInterval = 0.1
        manager.startAccelerometerUpdates(to: .main) { [weak self] data, _ in
            guard let self = self, let data = data else { return }
            // CMAcceleration is in g. DeviceMotionEvent and shakeDetect.ts use m/s².
            let g = 9.80665
            self.feed(
                x: data.acceleration.x * g,
                y: data.acceleration.y * g,
                z: data.acceleration.z * g,
                t: data.timestamp
            )
        }
    }

    func stop() {
        guard manager.isAccelerometerActive else { return }
        manager.stopAccelerometerUpdates()
        last = nil
        hits.removeAll()
    }

    private func feed(x: Double, y: Double, z: Double, t: TimeInterval) {
        guard let prev = last else {
            last = (x, y, z, t)
            return
        }
        if t - prev.t < sample { return }
        let delta = abs(x - prev.x) + abs(y - prev.y) + abs(z - prev.z)
        last = (x, y, z, t)
        guard delta >= force else { return }
        hits.append(t)
        let cutoff = t - windowSec
        hits.removeAll { $0 < cutoff }
        guard hits.count >= hitsNeeded else { return }
        guard t - lastFire >= cooldown else { return }
        hits.removeAll()
        lastFire = t
        onShake()
    }
}
