"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRepository = void 0;
const message_model_1 = __importDefault(require("../../domain/models/message.model"));
exports.messageRepository = {
    create: (createMessageDTO) => __awaiter(void 0, void 0, void 0, function* () {
        const message = new message_model_1.default(createMessageDTO);
        return yield message.save();
    }),
    find: ({ from, to }) => __awaiter(void 0, void 0, void 0, function* () {
        const messages = yield message_model_1.default.find().and([
            { $or: [{ to }, { to: from }] },
            { $or: [{ from }, { from: to }] }
        ]);
        return messages;
    }),
    edit: (id, state) => __awaiter(void 0, void 0, void 0, function* () {
        const messages = yield message_model_1.default.findByIdAndUpdate(id, { state }, { new: true });
        return messages;
    }),
    editMany: ({ from, to }) => __awaiter(void 0, void 0, void 0, function* () {
        const messages = yield message_model_1.default.updateMany({}, { state: 3 }, { new: true })
            .and([
            { to: from },
            { from: to },
            { $or: [{ state: 1 }, { state: 2 }] }
        ]).exec();
        return messages;
    }),
    delete: ({ id, who }) => __awaiter(void 0, void 0, void 0, function* () {
        const message = yield message_model_1.default.findById(id);
        if (message) {
            if (who[0] && !message.deletedTo.includes(who[0])) {
                message.deletedTo.push(who[0]);
            }
            if (who[1] && !message.deletedTo.includes(who[1])) {
                message.deletedTo.push(who[1]);
            }
            return yield message.save();
        }
    })
};
