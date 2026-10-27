export interface Language {
  id: string; // 'mr', 'hi', 'sa', 'bn', 'te', 'ta', 'gu', 'en'
  name: string;
  code: string;
  native_name: string;
  script: string;
  is_active: boolean;
  flag?: string;
  greeting?: string;
  greeting_meaning?: string;
}
