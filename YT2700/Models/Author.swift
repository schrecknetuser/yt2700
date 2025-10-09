import Foundation

struct Author: Identifiable, Equatable {
    let id: UUID
    var name: String
    var trackCount: Int
    
    init(id: UUID = UUID(), name: String, trackCount: Int = 0) {
        self.id = id
        self.name = name
        self.trackCount = trackCount
    }
}
