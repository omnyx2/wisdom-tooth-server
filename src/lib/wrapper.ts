export const wrapper = (handler: Function) => {
  return async (req: Express.Request, res: Express.Response, next) => {
    try {
      await handler(req, res, next).catch(next) 
    } catch (err) {
      
    }
  }}  
