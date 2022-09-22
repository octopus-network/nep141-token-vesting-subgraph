import {near, BigInt, log, JSONValue, json, Bytes, store} from "@graphprotocol/graph-ts";
import {JSON} from "assemblyscript-json";
import {
    ChangeBeneficiary,
    Claim, ClaimAll,
    CreateVesting,
    FreezeVesting, FtTransferResult, Legacy,
    TerminateVesting,
    UnfreezeVesting,
    UserAction, Vesting
} from "../generated/schema";

export function handleActionStatus(event: string, data: JSON.Obj, receipt: near.ReceiptWithOutcome):void {
    log.info("start handleActionStatus, event: {}, data: {}", [event, data.stringify()])

    if(event == "ft_transfer_result") {
        let claim_id = data.getString("transfer_id")!.valueOf()
        let result = FtTransferResult.load(claim_id)!
        result.is_success = data.getBool("is_success")!.stringify()=="true"
        result.save()
    }
}

export function handleUserAction(event: string, data: JSON.Obj, receipt: near.ReceiptWithOutcome, log_index: usize): void {
    log.info("start handleUserAction,event: {}, data: {}, log_index: {}", [event, data.stringify(), log_index.toString()]);

    let id = receipt.outcome.id.toHexString() + "_" + log_index.toString()
    let user_action = new UserAction(id)
    user_action.timestamp = receipt.block.header.timestampNanosec.toString()
    user_action.predecessor_id = receipt.receipt.predecessorId
    user_action.receipt_id = receipt.receipt.id.toBase58()
    user_action.vesting_id = data.getString("vesting_id") ? data.getString("vesting_id")!.valueOf() : null


    if (event == "create_vesting") {
        let action = new CreateVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        // user_action.action_type = "create_vesting"
        user_action.create_vesting = id
    } else if (event == "freeze_vesting") {
        let action = new FreezeVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        // user_action.action_type = "freeze_vesting"
        user_action.freeze_vesting = id
    } else if (event == "unfreeze_vesting") {
        let action = new UnfreezeVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()
        // user_action.action_type = "unfreeze_vesting"
        user_action.unfreeze_vesting = id
    } else if (event == "change_beneficiary") {
        let action = new ChangeBeneficiary(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.old_beneficiary = data.getString("old_beneficiary")!.valueOf()
        action.new_beneficiary = data.getString("new_beneficiary")!.valueOf()
        action.save()

        // user_action.action_type = "change_beneficiary"
        user_action.change_beneficiary = id

    } else if (event == "claim") {
        let action = new Claim(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.beneficiary = data.getString("beneficiary")!.valueOf()
        action.amount = data.getString("amount")!.valueOf()
        action.token_id = data.getString("token_id")!.valueOf()
        action.transfer_id = data.getString("transfer_id")!.valueOf()

        let ft_transfer_result = new FtTransferResult(action.transfer_id)
        ft_transfer_result.is_success = false
        ft_transfer_result.save()

        action.ft_transfer_result = ft_transfer_result.id

        action.save()
        // user_action.action_type = "claim"
        user_action.claim = id

    } else if (event == "claim_all") {
        let action = new ClaimAll(id)
        action.vesting_ids = data.getArr("vesting_ids")!.valueOf().map<string>((e): string => e.toString())
        action.beneficiary = data.getString("beneficiary")!.valueOf()
        action.amount = data.getString("amount")!.valueOf()
        action.token_id = data.getString("token_id")!.valueOf()
        action.transfer_id = data.getString("transfer_id")!.valueOf()

        let ft_transfer_result = new FtTransferResult(action.transfer_id)
        ft_transfer_result.is_success = false
        ft_transfer_result.save()

        action.ft_transfer_result = ft_transfer_result.id

        action.save()
        // user_action.action_type = "claim_all"
        user_action.claim_all = id

    } else if (event == "terminate_vesting") {
        let action = new TerminateVesting(id)
        action.vesting_id = data.getString("vesting_id")!.valueOf()
        action.save()

        // user_action.action_type = "terminate_vesting"
        user_action.terminate_vesting = id

        let vesting = Vesting.load(action.vesting_id)!
        vesting.is_terminated = true
        vesting.save()
    } else if (event == "legacy") {
        let action = new Legacy(id)
        action.account_id = data.getString("account_id")!.valueOf()
        action.token_id = data.getString("token_id")!.valueOf()
        action.amount = data.getString("amount")!.valueOf()
        action.save()

        // user_action.action_type = "legacy"
        user_action.legacy = id
    }
    user_action.action_type = event
    user_action.save();
}
