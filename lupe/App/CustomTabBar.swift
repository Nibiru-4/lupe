//
//  CustomTabBar.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

struct CustomTabBar: View {
    
    @Binding var selectedTab: Tab
    
    var body: some View {
        HStack(alignment: .center, spacing: 20) {
            tabButton(icon: "house", tab: .home)
            tabButton(icon: "trophy", tab: .trophy)
            tabButton(icon: "person", tab: .profile)
        }
        .padding()
        .background(AppColors.accent_background)
        .cornerRadius(25)
        .shadow(radius: 10)
        
    }
    
    private func tabButton(icon: String, tab: Tab) -> some View {
        Button {
            selectedTab = tab
        } label: {
            Image(systemName: icon)
                .font(.system(size: 22))
                .fontWeight(selectedTab == tab ? .bold : .regular)
                .foregroundColor(selectedTab == tab ? .white : .gray)
        }
    }
}
