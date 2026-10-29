// Backend sirf number deta hai, currency nahi. Isliye sirf number dikhate hain (jaise 15,000)
const formatPrice = (value) => Number(value).toLocaleString("en-US");

export default formatPrice;