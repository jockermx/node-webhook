import {publishToQueue} from '/services/MQService';

router.post('/msg',async(req, res, next)=>{
    let { queueName, payload } = req.body;
    await publishToQueue(queueName, payload);
    res.statusCode = 200;
    res.data = {"message-sent":true};
    next();
})