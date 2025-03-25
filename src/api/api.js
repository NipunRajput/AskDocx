import axios from "axios";

const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL; 
const API_KEY = import.meta.env.VITE_GROK_API_KEY;  



export const fetchGrokResponse = async (query) => {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "qwen-qwq-32b", 
                messages: [{ role: "user", content: query }],
                temperature: 0.7,
                max_tokens: 2000, 
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        
        console.log("✅ Groq API Response:", response.data);
        return response.data.choices[0]?.message?.content || "No response from Groq.";
    } catch (error) {
        console.error("❌ Error fetching from Groq:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch results from Groq.");
    }
};

export default fetchGrokResponse;