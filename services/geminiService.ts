import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Please provide a description manually.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, appealing, and sales-focused description (max 30 words) for a product named "${productName}" in the category "${category}". Focus on Indian market appeal.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description at this time.";
  }
};

export const generateShopDescription = async (shopName: string, productContext: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a warm, inviting, and professional description (max 50 words) for an Indian local shop named "${shopName}". 
      They sell items like: ${productContext}. 
      Emphasize trust, quality, and community connection.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description.";
  }
};

export const chatWithAssistant = async (query: string, context: string, userContext?: string): Promise<string> => {
  if (!apiKey) return "I'm offline right now (No API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: You are a helpful AI assistant for "DesiMart", an Indian e-commerce app. 
      User Query: ${query}
      Available Product Info: ${context}
      ${userContext ? `User Context (Recently Viewed/Cart): ${userContext}` : ''}
      
      Provide a helpful, polite, and concise answer. Suggest products if relevant.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting right now.";
  }
};

export const getPersonalizedRecommendations = async (pastOrders: string[], availableShops: string[]): Promise<string[]> => {
    if (!apiKey) return [];
    if (pastOrders.length === 0) return [];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the user's past orders: ${pastOrders.join(', ')}.
            And the available shops: ${availableShops.join(', ')}.
            
            Return a JSON array of up to 3 shop names from the available list that the user might like.
            Example: ["Shop A", "Shop B"]
            Only return the JSON array, no text.`
        });
        const text = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Recs Error", e);
        return [];
    }
};

export const analyzeSearchQuery = async (query: string): Promise<{ category?: string, keywords: string[], intent?: string }> => {
    if (!apiKey) return { keywords: [query] };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the shopping search query: "${query}".
            Return a JSON object with:
            - category: (Guess the product category if obvious, e.g. "Groceries", "Vegetables")
            - keywords: (Array of main keywords extracted from query)
            - intent: (User intent, e.g. "cheap", "bulk", "organic")
            
            Example output: { "category": "Vegetables", "keywords": ["onion", "potato"], "intent": "cheap" }
            Only return JSON.`
        });
         const text = response.text.replace(/```json|```/g, '').trim();
         return JSON.parse(text);
    } catch (e) {
        return { keywords: [query] };
    }
}