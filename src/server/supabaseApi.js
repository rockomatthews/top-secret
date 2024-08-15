import { supabase } from '../supabaseConfig'

export const fetchSomeData = async () => {
  const { data, error } = await supabase
    .from('your_table_name')
    .select('*')
  
  if (error) throw error
  return data
}

// Add more functions for different tables and queries as needed

export const insertSomeData = async (newData) => {
  const { data, error } = await supabase
    .from('your_table_name')
    .insert(newData)
  
  if (error) throw error
  return data
}