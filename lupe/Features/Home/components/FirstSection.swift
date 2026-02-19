//
//  FirstSection.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//
import SwiftUI

struct FirstSection : View {
    
    @State var text : String = ""
    
    var body : some View {
        CustomTextField(placeholder: "Search Champions or Users...", icon:"magnifyingglass", text: $text)
    }
}
