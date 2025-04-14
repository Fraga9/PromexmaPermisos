import { createClient } from '@supabase/supabase-js'

// Obtiene la URL y la clave anónima desde las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Crea y exporta el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('Supabase client created with URL:', supabaseUrl)
console.log('Supabase client created with ANON KEY:', supabaseAnonKey)