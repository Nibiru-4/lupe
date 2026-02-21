import Foundation

final class PatchNotesService {
    private let versionsURL = URL(string: "https://ddragon.leagueoflegends.com/api/versions.json")!
    
    func fetchLatestPatchLinks(limit: Int = 4) async throws -> [PatchNoteLink] {
        let versions: [String] = try await APIClient.shared.fetch(url: versionsURL)
        
        var uniquePatches: [String] = []
        for version in versions {
            let components = version.split(separator: ".")
            guard components.count >= 2 else { continue }
            
            let rawMajor = String(components[0])
            let minor = String(components[1])
            let patch = "\(publicMajor(from: rawMajor)).\(minor)"
            if !uniquePatches.contains(patch) {
                uniquePatches.append(patch)
            }
            if uniquePatches.count == limit {
                break
            }
        }
        
        return uniquePatches.compactMap(makePatchLink)
    }
    
    private func makePatchLink(_ patch: String) -> PatchNoteLink? {
        let components = patch.split(separator: ".")
        guard components.count == 2 else { return nil }
        let major = components[0]
        let minor = components[1]
        
        guard let patchURL = URL(
            string: "https://www.leagueoflegends.com/en-us/news/game-updates/patch-\(major)-\(minor)-notes/"
        ) else {
            return nil
        }
        
        return PatchNoteLink(patch: patch, url: patchURL)
    }

    private func publicMajor(from rawMajor: String) -> String {
        guard let value = Int(rawMajor) else { return rawMajor }
        // Riot patch notes currently use 26.x while Data Dragon versions are 16.x.
        return String(value + 10)
    }
}
