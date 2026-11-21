import AppKit
import AVFoundation
import NaturalLanguage
import WebKit

final class TranslationWindow: NSWindow {
    var titlebarDragRegion = NSRect.zero

    override func sendEvent(_ event: NSEvent) {
        if event.type == .leftMouseDown, !styleMask.contains(.fullScreen), let content = contentView {
            let point = content.convert(event.locationInWindow, from: nil)
            let yFromTop = content.isFlipped ? point.y - content.bounds.minY : content.bounds.maxY - point.y
            let pagePoint = NSPoint(x: point.x - content.bounds.minX, y: yFromTop)
            if titlebarDragRegion.contains(pagePoint) {
                performDrag(with: event)
                return
            }
        }
        super.sendEvent(event)
    }
}

final class PanelController: NSObject, NSApplicationDelegate, NSWindowDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    private let root: URL
    private let node: URL
    private let initialText: String
    private let speech = AVSpeechSynthesizer()
    private var window: TranslationWindow!
    private var webView: WKWebView!
    private var worker: Process?
    private var expanded = false
    private var pinned = false
    private var fullScreen = false
    private var userResized = false
    private var contentHeight: CGFloat = 365

    init(root: URL, node: URL, initialText: String) {
        self.root = root
        self.node = node
        self.initialText = initialText
    }

    private var page: URL { root.appendingPathComponent("panel/index.html") }

    func applicationDidFinishLaunching(_ notification: Notification) {
        let menu = NSMenu()
        let appMenu = NSMenuItem()
        appMenu.submenu = NSMenu()
        appMenu.submenu?.addItem(withTitle: "关闭窗口", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        appMenu.submenu?.addItem(withTitle: "退出 FelixDict", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(appMenu)
        let editMenu = NSMenuItem()
        editMenu.submenu = NSMenu(title: "编辑")
        editMenu.submenu?.addItem(withTitle: "剪切", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.submenu?.addItem(withTitle: "复制", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.submenu?.addItem(withTitle: "粘贴", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.submenu?.addItem(withTitle: "全选", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        menu.addItem(editMenu)
        NSApp.mainMenu = menu

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(self, name: "felixdict")
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        window = TranslationWindow(
            contentRect: NSRect(x: 0, y: 0, width: 468, height: contentHeight),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.title = "FelixDict"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        // Keep the native window controls in the same compact titlebar as the web header.
        window.toolbarStyle = .unifiedCompact
        window.toolbar = NSToolbar(identifier: "FelixDict.Titlebar")
        window.titlebarSeparatorStyle = .none
        window.contentMinSize = NSSize(width: 320, height: 230)
        window.collectionBehavior.insert(.fullScreenPrimary)
        window.delegate = self
        window.contentView = webView
        window.center()
        window.makeKeyAndOrderFront(nil)
        layoutWindowButtons()
        NSApp.activate(ignoringOtherApps: true)
        webView.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
    }

    func windowWillClose(_ notification: Notification) {
        stopWorker()
        NSApp.terminate(nil)
    }

    func windowDidBecomeKey(_ notification: Notification) {
        layoutWindowButtons()
    }

    func windowWillStartLiveResize(_ notification: Notification) {
        userResized = true
    }

    func windowDidResize(_ notification: Notification) {
        layoutWindowButtons()
    }

    func windowWillEnterFullScreen(_ notification: Notification) {
        fullScreen = true
        updateWindowLevel()
    }

    func windowDidExitFullScreen(_ notification: Notification) {
        restoreDesktopMode()
    }

    func windowDidFailToEnterFullScreen(_ window: NSWindow) {
        restoreDesktopMode()
    }

    private func restoreDesktopMode() {
        fullScreen = false
        updateWindowLevel()
        resize()
    }

    private func updateWindowLevel() {
        window.level = pinned && !fullScreen ? .floating : .normal
    }

    func applicationWillTerminate(_ notification: Notification) {
        stopWorker()
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        decisionHandler(navigationAction.request.url == page ? .allow : .cancel)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.webView === webView,
              let command = message.body as? [String: Any], let type = command["type"] as? String else { return }
        switch type {
        case "ready":
            send(["type": "init", "text": initialText,
                  "titlebarCenter": titlebarCenter()])
        case "translate":
            translate(command)
        case "cancel":
            stopWorker()
        case "copy":
            guard let text = command["text"] as? String, text.utf16.count <= 12000 else { return }
            NSPasteboard.general.clearContents()
            let copied = NSPasteboard.general.setString(text, forType: .string)
            send(["type": "notice", "message": copied ? "译文已复制" : "无法复制译文", "error": !copied])
        case "speak":
            guard let text = command["text"] as? String, text.utf16.count <= 12000 else { return }
            speech.stopSpeaking(at: .immediate)
            let utterance = AVSpeechUtterance(string: text)
            if let language = command["language"] as? String, !language.isEmpty {
                utterance.voice = AVSpeechSynthesisVoice(language: language)
            } else if let detected = NLLanguageRecognizer.dominantLanguage(for: text) {
                utterance.voice = AVSpeechSynthesisVoice(language: detected.rawValue)
            }
            speech.speak(utterance)
            send(["type": "notice", "message": "正在朗读"])
        case "layout":
            guard let height = command["height"] as? Double, height.isFinite else { return }
            let nextExpanded = command["expanded"] as? Bool ?? false
            if nextExpanded != expanded { userResized = false }
            expanded = nextExpanded
            contentHeight = max(230, min(height.rounded(.up), 1200))
            resize()
        case "titlebar":
            guard let edges = command["dragRegion"] as? [Double], edges.count == 4,
                  edges.allSatisfy(\.isFinite) else { return }
            let (left, top, right, bottom) = (edges[0], edges[1], edges[2], edges[3])
            window.titlebarDragRegion = NSRect(x: left, y: top, width: max(0, right - left),
                                               height: max(0, bottom - top))
        case "pin":
            pinned = command["pinned"] as? Bool ?? false
            updateWindowLevel()
            send(["type": "pin", "pinned": pinned])
        case "close":
            if fullScreen { window.toggleFullScreen(nil) }
            else { window.performClose(nil) }
        default:
            break
        }
    }

    private func titlebarCenter() -> CGFloat {
        guard let closeButton = window.standardWindowButton(.closeButton) else { return 20 }
        let buttonFrame = closeButton.convert(closeButton.bounds, to: nil)
        let webFrame = webView.convert(webView.bounds, to: nil)
        return webFrame.maxY - buttonFrame.midY
    }

    private func layoutWindowButtons() {
        // Match the 12-point controls and 20-point center spacing of the reference.
        let types: [NSWindow.ButtonType] = [.closeButton, .miniaturizeButton, .zoomButton]
        for (index, type) in types.enumerated() {
            guard let button = window.standardWindowButton(type) else { continue }
            let nativeBounds = button.bounds
            button.frame = NSRect(x: 7 + CGFloat(index) * 20, y: button.frame.midY - 6, width: 12, height: 12)
            button.bounds = nativeBounds
        }
    }

    private func resize() {
        guard !fullScreen, !window.isZoomed, !userResized else { return }
        guard let screen = window.screen ?? NSScreen.main else { return }
        let area = screen.visibleFrame.insetBy(dx: 8, dy: 8)
        let size = NSSize(width: min(expanded ? 850 : 468, area.width),
                          height: contentHeight)
        let oldFrame = window.frame
        var frame = window.frameRect(forContentRect: NSRect(origin: .zero, size: size))
        frame.size.height = min(frame.height, area.height)
        frame.origin.x = max(area.minX, min(oldFrame.midX - frame.width / 2, area.maxX - frame.width))
        frame.origin.y = max(area.minY, min(oldFrame.maxY - frame.height, area.maxY - frame.height))
        if frame != oldFrame { window.setFrame(frame, display: true) }
        layoutWindowButtons()
    }

    private func send(_ event: [String: Any]) {
        webView.callAsyncJavaScript("window.felixdictReceive(event)", arguments: ["event": event], in: nil, in: .page, completionHandler: nil)
    }

    private func stopWorker() {
        if let process = worker, process.isRunning { process.terminate() }
        worker = nil
    }

    private func translate(_ command: [String: Any]) {
        guard let id = command["id"] as? Int, let text = command["text"] as? String,
              text.utf16.count <= 2000, let target = command["target"] as? String,
              target.count < 8, let payload = try? JSONSerialization.data(withJSONObject: command) else { return }
        stopWorker()
        let process = Process()
        let input = Pipe()
        let output = Pipe()
        process.executableURL = node
        process.arguments = [root.appendingPathComponent("dist/cli.js").path, "--panel-translate"]
        process.currentDirectoryURL = root
        process.standardInput = input
        process.standardOutput = output
        process.standardError = FileHandle.nullDevice
        do {
            try process.run()
        } catch {
            send(["type": "error", "id": id, "message": "无法启动翻译进程，请检查 Node.js 路径"])
            return
        }
        worker = process
        var request = payload
        request.append(10)
        try? input.fileHandleForWriting.write(contentsOf: request)
        try? input.fileHandleForWriting.close()
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var buffer = Data()
            var completed = false
            let handle = output.fileHandleForReading
            while true {
                let chunk = handle.availableData
                if chunk.isEmpty { break }
                buffer.append(chunk)
                while let newline = buffer.firstIndex(of: 10) {
                    let line = buffer.prefix(upTo: newline)
                    buffer.removeSubrange(...newline)
                    guard var event = (try? JSONSerialization.jsonObject(with: line)) as? [String: Any] else { continue }
                    event["id"] = id
                    if event["type"] as? String == "error" || (event["pending"] as? [String])?.isEmpty == true {
                        completed = true
                    }
                    let response = event
                    DispatchQueue.main.async { [weak self] in
                        guard let self, self.worker === process else { return }
                        self.send(response)
                    }
                }
            }
            process.waitUntilExit()
            let failed = !completed || process.terminationStatus != 0
            DispatchQueue.main.async { [weak self] in
                guard let self, self.worker === process else { return }
                self.worker = nil
                if failed { self.send(["type": "error", "id": id, "message": "翻译进程中断，请重试"]) }
            }
        }
    }
}

let arguments = CommandLine.arguments
guard arguments.count == 2 else { exit(64) }
let root = URL(fileURLWithPath: arguments[0]).standardizedFileURL.deletingLastPathComponent().deletingLastPathComponent()
let initialText = String(decoding: FileHandle.standardInput.readDataToEndOfFile(), as: UTF8.self)
let controller = PanelController(root: root, node: URL(fileURLWithPath: arguments[1]), initialText: initialText)
let application = NSApplication.shared
application.setActivationPolicy(.accessory)
application.delegate = controller
application.run()
