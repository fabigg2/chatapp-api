import { IMessage } from "../../domain/interfaces/message.interface";
import Message from "../../domain/models/message.model";
import { CreateMessageDTO } from "../dto/message.dto";

export const messageRepository = {
    create:async (createMessageDTO: CreateMessageDTO) => {
        const message: IMessage = new Message(createMessageDTO);
        return await message.save()
    },
    find:async ({from, to}:any) => {
        console.log(from, to);
        const messages: IMessage[] = await Message.find().and([
            {$or: [{to}, {to:from}]},
            {$or: [{from}, {from:to}]}
        ]);
        return messages;
    },
    edit:async (id:string, state:number) => {
        const messages: IMessage = await Message.findByIdAndUpdate(id, {state}, {new: true});
        return messages;
    }

}