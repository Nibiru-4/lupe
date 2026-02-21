import SwiftUI
internal import Combine

struct PlayerHistoryView: View {
    let gameName: String
    let tagLine: String
    
    @StateObject private var viewModel = PlayerHistoryViewModel()
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if viewModel.isLoading {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                    .frame(maxWidth: .infinity)
                }
                
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }
                
                if let player = viewModel.player {
                    HStack(spacing: 12) {
                        if let iconId = player.profileIconId {
                            AsyncImage(url: Champion.summonerIconURL(for: iconId)) { phase in
                                switch phase {
                                case .success(let image):
                                    image.resizable().scaledToFill()
                                default:
                                    Color.gray.opacity(0.2)
                                }
                            }
                            .frame(width: 52, height: 52)
                            .clipShape(Circle())
                        } else {
                            Image(systemName: "person.crop.circle.fill")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 52, height: 52)
                                .foregroundColor(.gray)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("\(player.gameName)#\(player.tagLine)")
                                .font(.headline)
                            if let level = player.summonerLevel {
                                Text("Level \(level)")
                                    .foregroundColor(.secondary)
                            }
                            HStack(spacing: 6) {
                                RankBadgeView(tier: player.rankTier, size: 16)
                                Text(rankText(player: player))
                                    .font(.subheadline)
                                    .foregroundColor(.white.opacity(0.9))
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.black.opacity(0.25))
                    .cornerRadius(12)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Match history")
                        .font(.headline)
                    
                    if viewModel.matches.isEmpty {
                        Text("No matches yet.")
                            .foregroundColor(.secondary)
                    } else {
                        if let playerId = viewModel.player?.id {
                            ForEach(viewModel.matches) { match in
                                NavigationLink {
                                    MatchDetailView(playerId: playerId, matchId: match.matchId)
                                } label: {
                                    matchRow(match: match)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color("BackgroundColor").ignoresSafeArea())
        .navigationTitle("\(gameName)#\(tagLine)")
        .task {
            await viewModel.load(gameName: gameName, tagLine: tagLine)
        }
    }
    
    private func matchRow(match: PlayerMatchHistory) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 12) {
                AsyncImage(url: Champion.championIconURL(for: match.championName)) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        Color.gray.opacity(0.2)
                    }
                }
                .frame(width: 44, height: 44)
                .clipShape(RoundedRectangle(cornerRadius: 10))

                VStack(alignment: .leading, spacing: 6) {
                    Text(queueName(for: match.queueId))
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(.white)
                    Text("\(relativeDate(from: match.gameCreation)) • \(durationText(seconds: match.gameDuration))")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text("\(match.championName) • \(match.kda)")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 8) {
                    Text(match.win ? "WIN" : "LOSS")
                        .font(.subheadline.bold())
                        .foregroundColor(match.win ? .green : .red)
                    Image(systemName: "chevron.right")
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            draftRow(title: "Blue Draft", champions: match.blueDraft ?? [])
            draftRow(title: "Red Draft", champions: match.redDraft ?? [])
        }
        .padding(16)
        .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
        .cornerRadius(14)
    }
    
    private func draftRow(title: String, champions: [String]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundColor(.white.opacity(0.75))
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    ForEach(champions, id: \.self) { champion in
                        AsyncImage(url: Champion.championIconURL(for: champion)) { phase in
                            switch phase {
                            case .success(let image):
                                image.resizable().scaledToFill()
                            default:
                                Color.gray.opacity(0.2)
                            }
                        }
                        .frame(width: 30, height: 30)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
        }
    }
    
    private func queueName(for queueId: Int) -> String {
        switch queueId {
        case 420: return "Ranked Solo/Duo"
        case 440: return "Ranked Flex"
        case 400: return "Normal Draft"
        case 430: return "Normal Blind"
        case 450: return "ARAM"
        default: return "Queue \(queueId)"
        }
    }
    
    private func durationText(seconds: Int) -> String {
        let minutes = seconds / 60
        let remaining = seconds % 60
        return String(format: "%d:%02d", minutes, remaining)
    }
    
    private func relativeDate(from raw: String) -> String {
        guard let millis = Double(raw) else { return "Unknown date" }
        let date = Date(timeIntervalSince1970: millis / 1000)
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }

    private func rankText(player: PlayerProfile) -> String {
        guard let tier = player.rankTier else { return String(localized: "rank.unranked") }
        let division = player.rankDivision ?? ""
        if let lp = player.rankLp {
            return "\(tier.capitalized) \(division) - \(lp) LP"
        }
        return "\(tier.capitalized) \(division)"
    }
}

@MainActor
private final class PlayerHistoryViewModel: ObservableObject {
    @Published private(set) var player: PlayerProfile?
    @Published private(set) var matches: [PlayerMatchHistory] = []
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?
    
    private let service = PlayerHistoryService()
    
    func load(gameName: String, tagLine: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await service.searchAndSync(gameName: gameName, tagLine: tagLine)
            player = response.player
            matches = response.matches
        } catch {
            player = nil
            matches = []
            errorMessage = "Unable to fetch player history."
        }
        
        isLoading = false
    }
}
