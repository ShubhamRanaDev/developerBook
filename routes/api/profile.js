const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth')
const {check, validationResult} = require('express-validator')
const Profile = require("../../models/Profile")
const User = require("../../models/User")

//get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate("user", ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({msg: "There is no profile of this user"})
        }
        res.json(profile)
    } catch (e) {
        console.error(e.message)
        res.status(500).send('Profile request server error')
    }
})

//Post req for update or create user profile
router.post('/', [auth, [
    check('status', 'status is required')
        .not()
        .isEmpty(),
    check('skills', 'Skills is required')
        .not()
        .isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()})
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body

    //build profile object
    const profileFields={}
    profileFields.user= req.user.id;
    if(company) profileFields.company=company
    if(website) profileFields.website=website
    if(location) profileFields.location=location
    if(bio) profileFields.bio=bio
    if(status) profileFields.status=status
    if(githubusername) profileFields.githubusername=githubusername
    if(skills){
        profileFields.skills=skills.split(',').map(skill=>skill.trim())
    }
    profileFields.social={}
    if(youtube) profileFields.social.youtube=youtube
    if(twitter) profileFields.social.twitter=twitter
    if(facebook) profileFields.social.facebook=facebook
    if(linkedin) profileFields.social.linkedin=linkedin
    if(instagram) profileFields.social.instagram=instagram

    try{
        let profile = await Profile.findOne({user:req.user.id})
        if(profile)
        {
            //update
            profile= await Profile.findByIdAndUpdate(
                {user:req.user.id},
                {$set:profileFields},
                {new:true})

            return res.json(profile)
        }


        //create
        profile= new Profile(profileFields)

        await profile.save()
        res.json(profile)
        
    }catch (e) {
        console.error(e.message)
        res.status(500).send('server error')
    }
})

//get profile
router.get('/',async(req,res)=>{
    try{
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
    }catch (e) {
        console.error(e.message)
        res.status(500).send('server eroor')
    }
})

//get user with id
router.get('/user/:user_id',async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar'])

        if(!profile) return res.status(400).json({msg:'there is no such user'})

        res.json(profile)
        res.json(profiles)
    }catch (e) {
        console.error(e.message)
        if(e.kind == 'ObjectId'){
            return res.status(400).json({msg:'user not found'})
        }
        res.status(500).send('server eroor')
    }
})

//delete profile user and posts
router.delete('/',auth,async(req,res)=>{
    try{
        await Profile.findOneAndRemove({user : req.user.id})
        res.json(profiles)
    }catch (e) {
        console.error(e.message)
        res.status(500).send('server eroor')
    }
})

module.exports = router;