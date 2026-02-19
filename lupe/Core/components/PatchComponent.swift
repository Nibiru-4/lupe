import SwiftUI

struct PatchComponent: View {
    
    let title: String
    
    var body: some View {
        VStack(spacing: 8) {
            
            Text(title)
                .font(.headline)
            
            VStack {
                Text("Ligne 1")
                Text("Ligne 2")
                Text("Ligne 3")
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .padding(.horizontal,12)
        .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
        .cornerRadius(12)
        .shadow(radius: 4)
    }
}
