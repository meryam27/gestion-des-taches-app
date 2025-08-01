import axios from 'axios';

const token = localStorage.getItem('token'); // ou sessionStorage
const headers = {
  Authorization: `Bearer ${token}`,
};


const getDailyStats = async (date) => {
  const response = await axios.get('http://localhost:5001/api/employee/dashboard/stats/daily',
     { params: { date },
      headers
     });
  return response.data;
};

const getMonthlyStats = async (year, month) => {
  const response = await axios.get('http://localhost:5001/api/employee/dashboard/stats/monthly', 
    { params: { year, month } ,
     headers
});
  return response.data;
};

const getYearlyStats = async (year) => {
  const response = await axios.get('http://localhost:5001/api/employee/dashboard/stats/yearly', 
    { params: { year },
     headers   
  });
  return response.data;
};

const getUserStats = async () => {
  const response = await axios.get('http://localhost:5001/api/employee/dashboard/stats',
      { headers 
  });
  return response.data;
};

export default {
  getDailyStats,
  getMonthlyStats,
  getYearlyStats,
  getUserStats,
};