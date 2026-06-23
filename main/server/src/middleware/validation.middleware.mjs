import { ZodError } from 'zod';
import { errorResponse } from '../shared/utils/apiResponse.mjs';

/*
// ---  Original Code (Joi validation) ---
const validate  = (schema, source='body') =>{
    return (req, res, next) => {
        const dataToValidate = req[source];
        if(!dataToValidate){
            return res.status(400).json({
                success: false,
                message: `Validation target 'req.${source}' is missing or undefined.`
            });
        }
        // Execute validation validation gauntlet
        const { error , value} = schema.validate(dataToValidate,{
            abortEarly: false,    
            stripUnknown: true,   
            allowUnknown: false
        });
        if(error){
            const errorMessages = error.details.map((detail) => detail.message.replace(/"/g, '')).join(',');
            return res.status(400).json({
                success: false,
                message: `Validation Failure: ${errorMessage}`
            });
        }
        // replacing raw values with joi stand. values !
        req[source] = value;
        return next();
    };      
};
// --- End User's Original Code ---
*/

// Zod validation middleware


const validate = (schema) => {
    return (req, res, next) => {
        try {
            // Validate req.body, req.query, and req.params against the Zod schema
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            
            // Re-assign validated and stripped data back to req
            if (validatedData.body) req.body = validatedData.body;
            if (validatedData.query) req.query = validatedData.query;
            if (validatedData.params) req.params = validatedData.params;
            
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Map Zod errors to a readable string
                const errorMessages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                return errorResponse(res, 400, `Validation Failure: ${errorMessages}`);
            }
            return next(error);
        }
    };
};

export default validate;