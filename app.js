const express = require("express");
const bodyparser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');


const app = express();
app.use(bodyparser.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static("public"));

//Set up default mongoose connection
const mongoDB = 'mongodb+srv://admin-harsh:test123@cluster0.ob5es.mongodb.net/todolist';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log("success");
}).catch((err) => {
  console.log(err);
});

const itemschema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemschema);


    const One = new Item({
      name: "Welcome to your todolist!"

    })
    const Two = new Item({
      name: "Hit the + button to add a new item."

    })
    const Three = new Item({
      name: "<-- Hit this to delete an item."

    })
   const defaultitem = [One,Two,Three];
  

const listschema = mongoose.Schema({
  name: String,
  items : [itemschema]
})
const List = mongoose.model("List", listschema);



const port = process.env.PORT || 5000
 
app.get('/' , (req , res)=>{

 Item.find({},function(err, founditems){
 if (founditems.length === 0) {
 
  
  Item.insertMany(defaultitem, (err)=>{
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully savevd default items to DB.");
    } 
  });
  res.redirect("/");
  
 }else{
  res.render("list",{listtitle: "Today", newlistitem: founditems});

 }

 });

});

app.post('/' , (req , res)=>{
  
 const itemname = req.body.newitem ;
 const listname = req.body.list;

 const item = new Item({
name: itemname
 });

 if(listname === "Today"){
   item.save();
   res.redirect("/");
   res.redirect("/");
 }else{
    List.findOne({ name : listname}, function(err, foundlist){
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/" + listname );
    
  });
 }
});

app.post('/delete' , (req , res)=>{
  const checkeditem = req.body.checkbox;
  const listname = req.body.listname;

  if(listname === "Today"){
    Item.findByIdAndDelete(checkeditem, (err)=>{
      if (err) {
        console.log(err);
      }
    })
 res.redirect("/");
  }else{
     List.findOneAndUpdate({name : listname},{$pull: {items: {_id: checkeditem}}}, (err , foundlist) => {
       if (!err) {
         res.redirect("/" + listname);
       }
     });
  }

   
})
app.get('/about' , (req , res)=>{

  res.render("about");

})



app.get('/:id', function(req, res){
  const customlist = _.capitalize(req.params.id) ;
List.findOne({name : customlist},function(err, foundlist){
  if (!err) {
    if(!foundlist){
     // create a new list
     const list = new List({
      name : customlist,
      items : defaultitem
    });
    list.save(); 
    res.redirect("/" + customlist);
    

    }else{
      // show list
      res.render("list",{listtitle:foundlist.name,newlistitem: foundlist.items
      })

    }
  }
})

})


app.listen(port , ()=> console.log(' Server is up and running on port : ' + port))