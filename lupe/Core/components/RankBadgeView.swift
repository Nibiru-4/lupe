import SwiftUI

struct RankBadgeView: View {
    let tier: String?
    let size: CGFloat
    
    var body: some View {
        ZStack {
            Circle()
                .fill(colorForTier(tier))
            Image(systemName: "shield.fill")
                .resizable()
                .scaledToFit()
                .frame(width: size * 0.56, height: size * 0.56)
                .foregroundColor(.white.opacity(0.92))
        }
        .frame(width: size, height: size)
        .overlay(
            Circle()
                .stroke(Color.white.opacity(0.25), lineWidth: 1)
        )
    }
    
    private func colorForTier(_ tier: String?) -> Color {
        switch (tier ?? "").uppercased() {
        case "CHALLENGER": return Color(red: 0.36, green: 0.82, blue: 1.0)
        case "GRANDMASTER": return Color(red: 0.95, green: 0.31, blue: 0.36)
        case "MASTER": return Color(red: 0.69, green: 0.41, blue: 0.97)
        case "DIAMOND": return Color(red: 0.35, green: 0.66, blue: 0.98)
        case "EMERALD": return Color(red: 0.09, green: 0.72, blue: 0.52)
        case "PLATINUM": return Color(red: 0.28, green: 0.74, blue: 0.66)
        case "GOLD": return Color(red: 0.93, green: 0.73, blue: 0.24)
        case "SILVER": return Color(red: 0.66, green: 0.70, blue: 0.75)
        case "BRONZE": return Color(red: 0.71, green: 0.45, blue: 0.29)
        case "IRON": return Color(red: 0.41, green: 0.41, blue: 0.43)
        default: return Color.gray.opacity(0.6)
        }
    }
}
