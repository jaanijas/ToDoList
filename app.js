//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://jaanijas:Jaswant%2325@cluster0.rvglze2.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true});

const itemsSchema={
  name: String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to our todolist!"
});

const item2=new Item({
  name:"This is item2"
});

const item3=new Item({
  name:"Oh yeah this is three"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);



// Item.deleteMany({name:"Welcome to our todolist!"},function(err){
//   if(err)
//   {
//     console.log(err);
//   }else{
//     console.log("You have deleted Successfully");
//   }
// })
app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({},function(err,foundItems){
      if(foundItems.length===0){
         Item.insertMany(defaultItems,function(err){
           if(err)
           {
             console.log(err);
           }
           else{
             console.log("You have successfully completed");
           }
         })
         res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });

});

app.get("/:customListName",function(req, res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList)
      {
        // console.log("Doesn't exists");
        const list=new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        // console.log("exists");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully Done");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
