import {near, BigInt, log, JSONValue, json, Bytes, store} from "@graphprotocol/graph-ts";
import { JSON } from "assemblyscript-json";
import {
    ChangeBeneficiary,
    Claim,
    CreateVesting,
    FreezeVesting,
    TerminateVesting,
    UnfreezeVesting,
    UserAction, Vesting
} from "../generated/schema";

export function handleUserAction(event: string, data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_index: usize): void {
    log.info("start handleUserAction,event: {}, data: {}, log_index: {}",[event, data.stringify(), log_index.toString()]);
    log.info("base58: {}, string: {} , ", [receipt.receipt.id.toBase58(), receipt.receipt.id.toString()])

    let id = receipt.outcome.id.toHexString()+"_"+log_index.toString()
    let user_action = new UserAction(id)
    user_action.timestamp = receipt.block.header.timestampNanosec.toString()
    user_action.predecessor_id = receipt.receipt.predecessorId
    user_action.receipt_id = receipt.receipt.id.toBase58()
    user_action.vesting_id = data.getString("vesting_id")!.valueOf()


    if(event=="create_vesting") {
        let action = new CreateVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        user_action.action_type = "create_vesting"
        user_action.create_vesting = id
    } else if (event=="freeze_vesting") {
        let action = new FreezeVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        user_action.action_type = "freeze_vesting"
        user_action.freeze_vesting = id
    }  else if (event=="unfreeze_vesting") {
        let action = new UnfreezeVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        user_action.action_type = "unfreeze_vesting"
        user_action.unfreeze_vesting = id
    }  else if (event=="change_beneficiary") {
        let action = new ChangeBeneficiary(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.old_beneficiary = data.getString("old_beneficiary")!.valueOf()
        action.new_beneficiary = data.getString("new_beneficiary")!.valueOf()
        action.save()

        user_action.action_type = "change_beneficiary"
        user_action.change_beneficiary = id

    }  else if (event=="claim") {
        let action = new Claim(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.beneficiary = data.getString("beneficiary")!.valueOf()
        action.amount = data.getString("amount")!.valueOf()
        action.token_id = data.getString("token_id")!.valueOf()
        action.save()
        user_action.action_type = "claim"
        user_action.claim = id

    } else if (event=="terminate_vesting") {
        let action = new TerminateVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()

        user_action.action_type = "terminate_vesting"
        user_action.terminate_vesting = id

        let vesting = Vesting.load(action.vesting_id)!
        vesting.is_terminated = true
        vesting.save()
    }
    user_action.save();
}
