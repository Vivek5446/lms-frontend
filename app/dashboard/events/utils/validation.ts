import * as yup from 'yup'

const Validation = yup.object({
 title : yup.string().min(2,'title should be atleast of 2 character').max(150,'title should not be greater than 150 character').trim().required('title is required').typeError('title is required'),
 description : yup.string().min(1,'description should be atleast of 1 character').max(720,'description should not greater than 720 characters').trim().required('description is required').typeError('description is required'),
 price : yup.string(),
 eventDate : yup.mixed(),
 target : yup.string(),
 category:yup.string(),
 trigger : yup.string()
})

export default Validation;
