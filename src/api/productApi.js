// import localData from '../../db.json';

// Let the port be fixed , I'll switch to fetch with endpoints - till that i'd use async promise to fetchProducts
// since it's already stored in the db.json as a Products array

// team lead @ashwanth approved - sourashish gave the idea to use async calls so that the code won't look messed up.

// export const fetchProducts = async () => {
//   try {
//     if (localData && localData.products) { // if data present , if data.products present? true and true ? returns the data
//       return localData.products;
//     } else {
//       console.error("Error: 'db.json' does not contain a 'products' key.");
//       return [];
//     }
//   } catch (error) {
//     console.error("Failed to read data from local db.json:", error);
//     return [];
//   }
// };

//use fetch() - shift to fetch() - waiting for the merge of db.json & @Divyagna

{
  /* const DB_URL = "http://localhost:3000/products";

export const fetchProducts = async()=>{
  try{
    const response = await fetch(DB_URL);

    if(!response.ok){
          console.error(`Error fetching data:${response.status}`)
    }
    const products=response.json();
    return products;
  }
  catch(error){
    console.error("Error fetching details",error);
    return[];
  }
} */
}

// trying this to explore axios;

import axios from 'axios';
export const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/produrewqfcsadfa'); // no need of response.json - adv of axios
    return response.data;
  } catch (error) {
    console.error('Error fetching data via axios', error);
    return [];
  }
};
