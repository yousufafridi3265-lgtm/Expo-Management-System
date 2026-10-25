// Backend error { message } bhejta hai. Yeh function wohi message nikalta hai.
// Server band ho ya internet na ho to saaf message deta hai
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return "Could not connect to the server. Please check your internet connection or the server.";
  }
  return "Something went wrong. Please try again.";
};
