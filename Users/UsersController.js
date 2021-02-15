const express=require('express')
const router=express.Router()
const User=require('./User')
const bcrypt=require("bcryptjs")
const Category=require("../categories/Category")
const adminAuth=require("../middlewares/adminAuth")

//Rota da pagina de login
router.get("/login",(req,res)=>{
  if(req.session.user){
    res.redirect("/admin/articles")
  }else{
    res.render("admin/Users/login")
  }
})
//Rota da pagina de autenticação
router.post("/login/authentication",(req,res)=>{
  var password=req.body.password
  var email=req.body.email
  User.findOne({
    where:{
      email:email
    }
  }).then(user=>{
    if(user!=undefined){
      var correct=bcrypt.compareSync(password,user.password)
      if(correct){
        //Cria uma sessão
        req.session.user={
          id:user.id,
          email:user.email
        }
        res.redirect("/admin/articles")
      }else{
        res.redirect("/login")
      }
    }else{
      res.redirect("/login")
    }
  }).catch(()=>{
    res.redirect("/login")
  })
})

//Rota de Leitura dos dados da sessao
router.get("/leitura",(req,res)=>{
  res.json(req.session.user)
})

//Cria um usuário
router.get('/login/create',adminAuth,(req,res)=>{
  res.render('admin/Users/create')
})
router.post("/login/create/save",adminAuth,(req,res)=>{
  var email=req.body.email
  var password=req.body.password

  var salt=bcrypt.genSaltSync(10)
  var hash=bcrypt.hashSync(password,salt)

  User.findOne({
    where:{
      email:email
    }
  }).then(user=>{
    if(user!=undefined){
      res.redirect("/login/create")
    }else{
      User.create({
        email:email,
        password:hash
      }).then(()=>{
        res.redirect("/admin/users")
      }).catch(()=>{
        res.redirect("/login/create")
      })
    }
  }).catch(()=>{
    res.redirect("/login/create")
  })
})

//Rota dos usuarios
router.get("/admin/users",adminAuth,(req,res)=>{
  User.findAll().then(users=>{
    Category.findAll().then(categories=>{
      res.render("admin/Users/users",{
        users:users,
        categories:categories
      })
    })
  })
})

//Edita usuario
router.get("/admin/user/edit/:id",adminAuth,(req,res)=>{
  var id=req.params.id
  User.findOne({
    where:{
      id:id
    }
  }).then(user=>{
    if(user==undefined){
      res.redirect('/admin/users')
    }else{
      res.render("admin/users/edit",{
        user:user
      })
    }
  }).catch(()=>{
    res.redirect('/admin/users')
  })
})
router.post("/admin/user/edit/save",adminAuth,(req,res)=>{
  var id=req.body.id
  var email=req.body.email
  var password=req.body.password

  var salt=bcrypt.genSaltSync(10)
  var hash=bcrypt.hashSync(password,salt)

  User.update({
    email:email,
    password:hash
  },{
    where:{
      id:id
    }
  }).then(()=>{
    res.redirect('/admin/users')
  }).catch(()=>{
    res.redirect(`/admin/user/edit/:${id}`)
  })
})

//Deleta usuario
router.post("/admin/user/delete/save",adminAuth,(req,res)=>{
  var id=req.body.id
  if(!isNaN(id)){
    User.destroy({
      where:{
        id:id
      }
    }).then(()=>{
      res.redirect("/admin/users")
    }).catch(()=>{
      res.redirect("/admin/users")
    })
  }
})

//Logout
router.get("/logout",(req,res)=>{
  req.session.user=undefined
  res.redirect("/")
})

module.exports=router