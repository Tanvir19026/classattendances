const express=require('express');
const cors=require('cors');
const ExcelJS = require('exceljs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port =process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rovqdgv.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();

    const database=client.db("ClassAttendance_DB");
    const teachers_collection=database.collection("teachers_collection");
    const student_collection=database.collection("student_collection");
    const attendance_collection=database.collection("attendancelist");


//teacher is course
    app.get('/teachers',async(req,res)=>{
       const cursor=teachers_collection.find()
       const result=await cursor.toArray()
       res.send(result)
    })

    app.delete('/teachers/:id',async(req,res)=>{
        const id=req.params.id;
        console.log('delete',id)
        const query={_id:new  ObjectId(id)}
        const result=await teachers_collection.deleteOne(query)
        res.send(result)
    })

    app.get('/teachers/:id',async(req,res)=>{
      const id=req.params.id;
      console.log('updates',id)
      const query={_id:new  ObjectId(id)}
      const result=await teachers_collection.findOne(query)
      res.send(result)
  })

  app.put('/teachers/:id',async(req,res)=>{
    const id=req.params.id;
    const course=req.body;
    console.log(course,id)
    const filter={_id:new ObjectId(id)}
    const options={upsert:true}
    const updateCourse={
      $set:{
        teacherName:course.teacherName,
        email:course.email,
        courseCode:course.courseCode,
        courseName:course.courseName

      }
    }
    const result=await teachers_collection.updateOne(filter,updateCourse,options)
    res.send(result);
  })

    app.get('/singleteacher',async (req,res)=>{
        const email = req.query.email;
        const query = { email: email };
        const cursor =teachers_collection.find(query);
        const singleTeacher = await cursor.toArray();
        res.send(singleTeacher);
       })

    app.post('/teachers',async(req,res)=>{
        const teacher=req.body;
        console.log('new teacher',teacher);
        const result=await teachers_collection.insertOne(teacher);
        res.send(result)
    })

    app.post('/addstudent',async (req,res)=>{

    const {jsonData,courseName,courseCode}=req.body;
    console.log(courseName,'courseNmae');

    const jsonDataWithCourseName = jsonData.map((item) => ({
      ...item,
      courseCode:courseCode,
      courseName: courseName,
    }));
    result=await student_collection.insertMany(jsonDataWithCourseName)
    res.send(result)
    console.log('success')
    })


  /**  app.get('/teachers/:id',async(req,res)=>{
      const id=req.params.id;
      console.log('updates',id)
      const query={_id:new  ObjectId(id)}
      const result=await teachers_collection.findOne(query)
      res.send(result)
  })*/ 


 

    app.get('/getstudentbycourse/:coursename',async(req,res)=>{
      const courseName=req.params.coursename;
      console.log(courseName,'courseName')
      const query={courseName:courseName}
      const cursor= student_collection.find(query)
      const studentList=await cursor.toArray();
      res.send(studentList)
    })

    app.get('/getstudentbycourse',async(req,res)=>{
      const cursor=student_collection.find()
      const result=await cursor.toArray()
      res.send(result)
   })



  const savedData = []; // In-memory storage, replace with a database in production

  app.post('/savedata',async (req, res) => {
  const dataToSave = req.body;
  const savedData = await attendance_collection.insertOne(dataToSave);
  res.send(savedData)
  console.log('sssss')
  //res.json({ success: true, message: 'Data saved successfully', data: savedData });

  });

  app.get('/getattendances/:coursename',async(req,res)=>{
    const courseName=req.params.coursename;
    console.log(courseName,'courseName')
    const query={courseName:courseName}
    const cursor= attendance_collection.find(query)
    const studentList=await cursor.toArray();
    res.send(studentList)
  })


  






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);












app.get('/',(req,res)=>{

  res.send('Class Attendance is ready')
})

app.listen(port,()=>{
    console.log(`everything is ready,${port}`)
})