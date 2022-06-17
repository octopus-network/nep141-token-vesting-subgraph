import {near, BigInt, log, JSONValue, json, Bytes, store} from "@graphprotocol/graph-ts";
import { handleVestingEvent } from "./vesting_event";
import { JSON } from "assemblyscript-json";
import {handleUserAction} from "./user_action";

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
	let actions = receipt.receipt.actions;
    let signerId = receipt.receipt.signerId.toString();
    let contractId = receipt.receipt.predecessorId.toString();
    let receiverId = receipt.receipt.receiverId.toString();

    for (let i = 0; i < actions.length; i++) {
        let action = actions[i];
        if (action.kind == near.ActionKind.FUNCTION_CALL) {
            handleFunctionCall(action.toFunctionCall(), receipt)
        }
    }
}

function handleFunctionCall(functionCall: near.FunctionCallAction, receipt: near.ReceiptWithOutcome): void {
	log.info("start handleFunctionCall", []);
    let outcome = receipt.outcome;

    for (let i = 0; i < outcome.logs.length; i++) {
        let outcomeLog = outcome.logs[i];
        log.info('receipt.outcome.log[{}]= {}',[i.toString(),outcomeLog.toString()])
        if (outcomeLog.startsWith("EVENT_JSON:")) {
            outcomeLog = outcomeLog.replace("EVENT_JSON:", "");
            // let bytes = Bytes.fromUTF8(outcomeLog)
            // const jsonObject = json.fromBytes(bytes).toObject();
            // const jsonObject = json.fromString(outcomeLog);
            let jsonObject = <JSON.Obj>(JSON.parse(outcomeLog));

            if(jsonObject.get("vesting_event")) {
                handleVestingEvent(
                    jsonObject.getString("vesting_event")!.valueOf(),
                    jsonObject.getObj("data")!,
                )
            }

			if(jsonObject.get("user_action")) {
				handleUserAction(
                    jsonObject.getString("user_action")!.valueOf(),
                    jsonObject.getObj("data")!,
                    receipt,
                    i
                )
			}
        }
    }
    log.info("end handleFunctionCall", []);
}


