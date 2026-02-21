import Foundation

struct PatchNoteLink: Identifiable, Hashable {
    let patch: String
    let url: URL
    
    var id: String { patch }
    var title: String { "Patch \(patch)" }
}
