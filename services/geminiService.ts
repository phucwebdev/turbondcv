import { GoogleGenAI, Type } from "@google/genai";
import type { TutorProfile, Verification } from '../types';
import { VerificationStatus } from '../types';

const API_KEY = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_API_KEY)
    || process.env.API_KEY
    || process.env.VITE_GOOGLE_API_KEY
    || '';

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "Họ và tên đầy đủ của gia sư." },
    email: { type: Type.STRING, description: "Email liên hệ chính xác xuất hiện trong CV." },
    phone: { type: Type.STRING, description: "Số điện thoại liên hệ (giữ nguyên định dạng hoặc nhóm số)." },
        location: {
            type: Type.OBJECT,
            properties: {
                city: { type: Type.STRING, description: "Tỉnh/Thành phố." },
                district: { type: Type.STRING, description: "Quận/Huyện." },
            },
            required: ['city', 'district']
        },
        salaryPerHour: { type: Type.NUMBER, description: "Mức lương mong muốn theo giờ (VND)." },
        subjects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các môn học có thể dạy." },
        mode: { type: Type.STRING, enum: ["online", "offline", "hybrid"], description: "Hình thức dạy." },
        education: {
            type: Type.OBJECT,
            properties: {
                university: { type: Type.STRING, description: "Tên trường Đại học/Cao đẳng." },
                degree: { type: Type.STRING, description: "Bằng cấp (Cử nhân, Kỹ sư, Thạc sĩ...)" },
            },
            required: ['university', 'degree']
        },
        awards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Tên giải thưởng." },
                    year: { type: Type.NUMBER, description: "Năm đạt giải (nếu có)." },
                },
                required: ['name']
            }
        },
        experienceSummary: { type: Type.STRING, description: "Tóm tắt kinh nghiệm giảng dạy (300-400 ký tự)." },
        evidenceUrls: { type: Type.ARRAY, items: { type: Type.STRING}, description: "Danh sách các URL dẫn chứng được tìm thấy trong CV." },
        verification: {
            type: Type.OBJECT,
            properties: {
                awardValidity: { type: Type.STRING, enum: ["valid", "unclear", "suspect"] },
                universityValidity: { type: Type.STRING, enum: ["valid", "unclear", "suspect"] },
                notes: { type: Type.STRING, description: "Giải thích ngắn gọn cho việc xác thực, liệt kê URL đã dùng." },
            },
            required: ['awardValidity', 'universityValidity', 'notes']
        }
    },
    required: [
        'fullName', 'location', 'subjects', 'mode', 'education', 'awards', 
        'experienceSummary', 'evidenceUrls', 'verification'
    ] // email có thể không có trong CV nên không bắt buộc
};

const UNIVERSITY_VALIDATION_URL = "https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_tr%C6%B0%E1%BB%9Dng_%C4%91%E1%BA%A1i_h%E1%BB%8Dc,_h%E1%BB%8Dc_vi%E1%BB%87n_v%C3%A0_cao_%C4%91%E1%BA%B3ng_t%E1%BA%A1i_Vi%E1%BB%87t_Nam";

const buildPrompt = (cvText: string): string => `
System/Instruction:
Bạn là trợ lý kiểm chứng hồ sơ gia sư. Nhiệm vụ:
- Trích xuất thông tin cấu trúc từ CV.
- Đối chiếu "giải thưởng" (nếu có URL trong CV) và "trường đại học".
- Về mức lương: chỉ trích xuất 'salaryPerHour' NẾU CV có ghi rõ "mức lương mong muốn theo giờ". Nếu không có, hãy bỏ qua trường này trong JSON output.
- Kết luận ngắn gọn, có thể giải thích, tránh bịa đặt. Nếu không đủ bằng chứng, trả "unclear".
- Tuyệt đối ghi rõ URL nào hỗ trợ kết luận trong phần "notes".
- Trả về một JSON duy nhất theo schema đã định nghĩa, không thêm bất kỳ văn bản nào khác.

User Content:

CV_TEXT:
${cvText}

CONTEXT_URL_FOR_UNIVERSITY_VALIDATION:
${UNIVERSITY_VALIDATION_URL}

Nhiệm vụ:
1) Trích xuất toàn bộ thông tin hồ sơ của gia sư từ CV_TEXT, bao gồm email (nếu xuất hiện), số điện thoại (nếu có) và các URL dẫn chứng nếu có và điền vào trường 'evidenceUrls'. Nếu có nhiều email, chọn email liên hệ chính (ưu tiên có từ 'liên hệ' gần đó). Với số điện thoại, loại bỏ ký tự không cần thiết ngoại trừ dấu '+' ở đầu nếu là mã quốc tế.
2) Trường đại học: DÙNG DUY NHẤT CONTEXT_URL_FOR_UNIVERSITY_VALIDATION ở trên để kiểm tra xem tên trường có trong danh sách các trường được công nhận tại Việt Nam không. Chỉ trả về "valid" nếu tên trường khớp chính xác với một mục trong danh sách trên Wikipedia.
3) Giải thưởng: Nếu CV có cung cấp URL dẫn chứng cho giải thưởng, hãy đối chiếu. Nếu không có URL, đánh giá là "unclear".
4) Nếu không đủ bằng chứng cho một mục nào đó, trả "unclear". Nếu có mâu thuẫn rõ rệt, trả "suspect".
5) Điền kết quả kiểm chứng vào mục "verification".
`;

export const analyzeCvWithGemini = async (cvText: string): Promise<TutorProfile> => {
    if (!cvText.trim()) {
        throw new Error("CV text cannot be empty.");
    }

    const prompt = buildPrompt(cvText);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        const newProfile: TutorProfile = {
            ...parsedData,
            id: `tutor-${new Date().getTime()}`,
            salaryPerHour: parsedData.salaryPerHour ?? null,
            verification: {
                ...parsedData.verification,
                awardValidity: parsedData.verification.awardValidity as VerificationStatus,
                universityValidity: parsedData.verification.universityValidity as VerificationStatus
            }
        };

        return newProfile;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to analyze CV. The model may have returned an invalid format or an error occurred.");
    }
};

// Optional: raw fetch helper using the REST endpoint and the same API key.
export const callGeminiRest = async (promptText: string) => {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const body = {
        contents: [
            { parts: [{ text: promptText }] }
        ]
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini REST error: ${res.status} ${text}`);
    }

    return res.json();
};