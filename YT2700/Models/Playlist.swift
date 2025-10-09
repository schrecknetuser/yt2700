import Foundation

struct Playlist: Identifiable, Equatable {
    let id: UUID
    var name: String
    var tracks: [Track]
    var dateCreated: Date
    
    init(id: UUID = UUID(), name: String, tracks: [Track] = [], dateCreated: Date = Date()) {
        self.id = id
        self.name = name
        self.tracks = tracks
        self.dateCreated = dateCreated
    }
}
