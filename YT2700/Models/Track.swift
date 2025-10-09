import Foundation
import CoreData

struct Track: Identifiable, Equatable {
    let id: UUID
    var name: String
    var authorName: String
    var duration: TimeInterval
    var fileURL: URL?
    var youtubeID: String?
    var dateAdded: Date
    var isDownloaded: Bool
    var inLibrary: Bool
    
    init(id: UUID = UUID(), name: String, authorName: String, duration: TimeInterval, fileURL: URL? = nil, youtubeID: String? = nil, dateAdded: Date = Date(), isDownloaded: Bool = false, inLibrary: Bool = false) {
        self.id = id
        self.name = name
        self.authorName = authorName
        self.duration = duration
        self.fileURL = fileURL
        self.youtubeID = youtubeID
        self.dateAdded = dateAdded
        self.isDownloaded = isDownloaded
        self.inLibrary = inLibrary
    }
}
