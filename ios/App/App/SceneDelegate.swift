import UIKit
import Capacitor

/// Paints the window behind the WebView so the status bar and home indicator
/// match the system theme. The shipped 1.1 binary still has a white UIKit
/// gap; this lands on the next store build.
class NothoBridgeViewController: CAPBridgeViewController {
    override var preferredStatusBarStyle: UIStatusBarStyle {
        traitCollection.userInterfaceStyle == .dark ? .lightContent : .darkContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        applyChrome()
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
