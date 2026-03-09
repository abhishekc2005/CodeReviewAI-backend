const aiService = require("../services/ai.service")

function delay(ms){
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports.getReview = async (req,res)=>{

 try{

   const code = req.body.code;

   if(!code){
      return res.status(400).json({
         error:"Code is required"
      })
   }

   // small delay to avoid rate limit
   await delay(2000)

   const response = await aiService(code);

   res.json({
      review: response
   })

 }catch(error){

   console.error("AI Error:",error)

   res.status(500).json({
      error:"AI review failed"
   })

 }

}
