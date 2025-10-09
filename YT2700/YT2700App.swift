import SwiftUI

@main
struct YT2700App: App {
    let persistenceController = PersistenceController.shared
    @StateObject private var audioPlayer = AudioPlayerService.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .environmentObject(audioPlayer)
        }
    }
}
