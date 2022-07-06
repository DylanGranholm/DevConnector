const express =  require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const { check, validationResult} = require('express-validator');

const User = require('../../models/Users');

// @route POST api/users
// @desc Register Data
// @acess Public
router.post('/', 
    [
        check('name','Name is required')
        .not()
        .isEmpty(),
        check('email', 'Please enter include a valid email')
        .isEmail(),
        check('password', 'Please enter a password with 6 or more characters')
        .isLength({min: 6})

    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body;

        try{
            //check for user exists already
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({errors: [{msg: 'User already exists'}]});
            }
            //get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            //create user
            user = new User({
                name,
                email,
                avatar,
                password
            });

            //encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // return jsonwebtoken
            res.send("user Registered")

        } catch(err){
            console.error(err.message);
            res.status(500).send("Server Error")
        }
        
});


module.exports = router;