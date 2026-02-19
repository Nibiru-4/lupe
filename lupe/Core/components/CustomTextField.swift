//
//  SearchInput.swift
//  lupe
//
//  Created by Yassin Meghazi on 13/02/2026.
//
import SwiftUI


struct CustomTextField: View {
    
    var placeholder : String
    let icon : String // SF symbol string
    @Binding var text: String
    var onSubmit: (() -> Void)? = nil
    @FocusState var isFocused: Bool
    
    var body: some View {
        
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.gray)
            
            TextField(placeholder,text: $text)
                .submitLabel(.search)
                .onSubmit {
                    onSubmit?()
                }
            
            if(!text.isEmpty){
                Button(action : {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill").foregroundColor(.gray)
                }
            }
        }
        
        
        
        
            .padding()
            .background(Color(red: 0x1a/255, green: 0x1b/255, blue: 0x27/255))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isFocused ? Color.blue : Color.clear,lineWidth: 2)
            )
            .focused($isFocused)
    }
}
