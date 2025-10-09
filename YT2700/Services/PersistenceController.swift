import CoreData
import Foundation

class PersistenceController {
    static let shared = PersistenceController()
    
    let container: NSPersistentContainer
    
    init(inMemory: Bool = false) {
        container = NSPersistentContainer(name: "YT2700DataModel")
        
        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }
        
        container.loadPersistentStores { description, error in
            if let error = error {
                fatalError("Core Data store failed to load: \(error.localizedDescription)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
    }
    
    func saveContext() {
        let context = container.viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nsError = error as NSError
                print("Error saving context: \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    func fetchTracks() -> [Track] {
        let request: NSFetchRequest<TrackEntity> = TrackEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \TrackEntity.name, ascending: true)]
        
        do {
            let entities = try container.viewContext.fetch(request)
            return entities.map { Track(
                id: $0.id ?? UUID(),
                name: $0.name ?? "",
                authorName: $0.authorName ?? "",
                duration: $0.duration,
                fileURL: $0.fileURL,
                youtubeID: $0.youtubeID,
                dateAdded: $0.dateAdded ?? Date(),
                isDownloaded: $0.isDownloaded,
                inLibrary: true
            )}
        } catch {
            print("Error fetching tracks: \(error)")
            return []
        }
    }
    
    func addTrack(_ track: Track) {
        let entity = TrackEntity(context: container.viewContext)
        entity.id = track.id
        entity.name = track.name
        entity.authorName = track.authorName
        entity.duration = track.duration
        entity.fileURL = track.fileURL
        entity.youtubeID = track.youtubeID
        entity.dateAdded = track.dateAdded
        entity.isDownloaded = track.isDownloaded
        
        saveContext()
    }
    
    func deleteTrack(_ track: Track) {
        let request: NSFetchRequest<TrackEntity> = TrackEntity.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", track.id as CVarArg)
        
        do {
            let entities = try container.viewContext.fetch(request)
            entities.forEach { container.viewContext.delete($0) }
            saveContext()
        } catch {
            print("Error deleting track: \(error)")
        }
    }
    
    func fetchPlaylists() -> [Playlist] {
        let request: NSFetchRequest<PlaylistEntity> = PlaylistEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \PlaylistEntity.dateCreated, ascending: false)]
        
        do {
            let entities = try container.viewContext.fetch(request)
            return entities.map { playlistEntity in
                let tracks = (playlistEntity.tracks?.array as? [TrackEntity] ?? []).map { trackEntity in
                    Track(
                        id: trackEntity.id ?? UUID(),
                        name: trackEntity.name ?? "",
                        authorName: trackEntity.authorName ?? "",
                        duration: trackEntity.duration,
                        fileURL: trackEntity.fileURL,
                        youtubeID: trackEntity.youtubeID,
                        dateAdded: trackEntity.dateAdded ?? Date(),
                        isDownloaded: trackEntity.isDownloaded,
                        inLibrary: true
                    )
                }
                return Playlist(
                    id: playlistEntity.id ?? UUID(),
                    name: playlistEntity.name ?? "",
                    tracks: tracks,
                    dateCreated: playlistEntity.dateCreated ?? Date()
                )
            }
        } catch {
            print("Error fetching playlists: \(error)")
            return []
        }
    }
    
    func addPlaylist(_ playlist: Playlist) {
        let entity = PlaylistEntity(context: container.viewContext)
        entity.id = playlist.id
        entity.name = playlist.name
        entity.dateCreated = playlist.dateCreated
        
        saveContext()
    }
    
    func addSearchHistory(_ searchText: String) {
        let entity = SearchHistoryEntity(context: container.viewContext)
        entity.id = UUID()
        entity.searchText = searchText
        entity.timestamp = Date()
        
        saveContext()
    }
    
    func fetchSearchHistory(limit: Int = 10) -> [String] {
        let request: NSFetchRequest<SearchHistoryEntity> = SearchHistoryEntity.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \SearchHistoryEntity.timestamp, ascending: false)]
        request.fetchLimit = limit
        
        do {
            let entities = try container.viewContext.fetch(request)
            return entities.map { $0.searchText ?? "" }
        } catch {
            print("Error fetching search history: \(error)")
            return []
        }
    }
}

@objc(TrackEntity)
class TrackEntity: NSManagedObject {
    @NSManaged var id: UUID?
    @NSManaged var name: String?
    @NSManaged var authorName: String?
    @NSManaged var duration: Double
    @NSManaged var fileURL: URL?
    @NSManaged var youtubeID: String?
    @NSManaged var dateAdded: Date?
    @NSManaged var isDownloaded: Bool
    @NSManaged var playlists: NSSet?
}

extension TrackEntity {
    @objc(fetchRequest)
    class func fetchRequest() -> NSFetchRequest<TrackEntity> {
        return NSFetchRequest<TrackEntity>(entityName: "TrackEntity")
    }
}

@objc(PlaylistEntity)
class PlaylistEntity: NSManagedObject {
    @NSManaged var id: UUID?
    @NSManaged var name: String?
    @NSManaged var dateCreated: Date?
    @NSManaged var tracks: NSOrderedSet?
}

extension PlaylistEntity {
    @objc(fetchRequest)
    class func fetchRequest() -> NSFetchRequest<PlaylistEntity> {
        return NSFetchRequest<PlaylistEntity>(entityName: "PlaylistEntity")
    }
}

@objc(SearchHistoryEntity)
class SearchHistoryEntity: NSManagedObject {
    @NSManaged var id: UUID?
    @NSManaged var searchText: String?
    @NSManaged var timestamp: Date?
}

extension SearchHistoryEntity {
    @objc(fetchRequest)
    class func fetchRequest() -> NSFetchRequest<SearchHistoryEntity> {
        return NSFetchRequest<SearchHistoryEntity>(entityName: "SearchHistoryEntity")
    }
}
