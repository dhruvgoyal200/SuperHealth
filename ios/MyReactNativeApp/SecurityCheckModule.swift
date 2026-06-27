import Foundation
import React

@objc(SecurityCheckModule)
class SecurityCheckModule: NSObject {
  
  @objc(checkDeviceSecurity:withResolver:withRejecter:)
  func checkDeviceSecurity(
    _ options: NSDictionary,
    withResolver resolve: @escaping RCTPromiseResolveBlock,
    withRejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let isInsecure = isDeviceJailbroken()
    let result: [String: Any] = [
      "isInsecure": isInsecure,
      "type": isInsecure ? "jailbroken" : "secure"
    ]
    resolve(result)
  }
  
  private func isDeviceJailbroken() -> Bool {
    // Check for common jailbreak-related files and directories
    let jailbreakPaths = [
      "/Applications/Cydia.app",
      "/Library/MobileSubstrate/MobileSubstrate.dylib",
      "/bin/bash",
      "/usr/sbin/sshd",
      "/etc/apt",
      "/var/stash",
      "/etc/ssh/sshd_config",
      "/private/var/lib/apt/",
      "/.cydia_installer",
      "/.installed_packages",
      "/System/Library/LaunchDaemons/com.saurik.Cydia.System.plist"
    ]
    
    for path in jailbreakPaths {
      if FileManager.default.fileExists(atPath: path) {
        return true
      }
    }
    
    // Check if app can write outside its sandbox
    let testPath = NSTemporaryDirectory() + "jailbreak_test.txt"
    do {
      try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
      try FileManager.default.removeItem(atPath: testPath)
      // If we can write to temp, it might indicate a compromised environment
    } catch {
      return false
    }
    
    // Check for fork and dyld injection
    if checkForDyldInjection() {
      return true
    }
    
    // Check for unsandboxed process
    if isProcessUnsandboxed() {
      return true
    }
    
    return false
  }
  
  private func checkForDyldInjection() -> Bool {
    let env = ProcessInfo.processInfo.environment
    // Check for DYLD environment variables used for injecting code
    return env["DYLD_INSERT_LIBRARIES"] != nil
  }
  
  private func isProcessUnsandboxed() -> Bool {
    var stat = stat()
    guard stat(FileManager.default.currentDirectoryPath, &stat) == 0 else {
      return false
    }
    
    // If process can access restricted file system paths, it might be unsandboxed
    let restrictedPath = "/private/var/mobile/Library/Preferences/com.apple.springboard.plist"
    return FileManager.default.fileExists(atPath: restrictedPath)
  }
}
