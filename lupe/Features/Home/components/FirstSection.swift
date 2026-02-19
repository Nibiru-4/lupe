//
//  FirstSection.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//
import SwiftUI

struct FirstSection : View {
    
    @Binding var text : String
    var onSubmit: (() -> Void)? = nil
    
    var body : some View {
        CustomTextField(
            placeholder: "Search Champions or Users...",
            icon:"magnifyingglass",
            text: $text,
            onSubmit: onSubmit
        )
    }
}
