import SwiftUI

struct ChampionNotFoundView: View {
    
    let query: String
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.magnifyingglass")
                .font(.system(size: 42))
                .foregroundColor(.orange)
            Text("No champion found")
                .font(.title3)
                .bold()
            Text("No champion matches \"\(query)\".")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
        .navigationTitle("Search")
        .navigationBarTitleDisplayMode(.inline)
    }
}
