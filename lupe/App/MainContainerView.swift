//
//  MainContainerView.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//
import SwiftUI

enum Tab {
    case home
    case trophy
    case profile
}

struct MainContainerView: View {
    
    @State private var selectedTab: Tab = .home
    
    var body: some View {
        ZStack {
            
            AppColors.background
                            .ignoresSafeArea()
        
            Group {
                switch selectedTab {
                case .home:
                    HomeView()
                case .trophy:
                    TrophyView(viewModel: ChampionViewModel())
                case .profile:
                    ProfileView()
                }
            }
            VStack {
                Spacer()
                CustomTabBar(selectedTab: $selectedTab)
                    .padding(.horizontal,40)
                    .padding(.bottom,30)
            }
        }
    }
}


