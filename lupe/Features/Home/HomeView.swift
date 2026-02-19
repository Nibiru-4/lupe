//
//  HomeView.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//

import SwiftUI

struct HomeView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    FirstSection()
                    SecondSection()
                }
                .frame(maxWidth: .infinity,maxHeight: .infinity ,alignment: .topLeading)
                .navigationTitle("home.title")
                .contentShape(Rectangle())
                .onTapGesture {
                    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                }
            }
          
        }
    }
}
