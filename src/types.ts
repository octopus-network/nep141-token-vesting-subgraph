import {BigInt, JSONValue} from "@graphprotocol/graph-ts";
import { JSON, JSONEncoder } from "assemblyscript-json";
import {Vesting} from "../generated/schema";

export class VestingEntity {
	id: string
	type: string
	beneficiary: string
	start_time: BigInt | null
	end_time: BigInt | null
	time_cliff_list: string | null
	is_frozen: bool
	token_id: string
	claimed_token_amount: string
	total_vesting_amount: string
	create_time: BigInt | null

	constructor(
		id: string,
		type: string, beneficiary: string,
		start_time: BigInt | null,
		end_time: BigInt | null,
		time_cliff_list: string | null,
		is_frozen: bool,
		token_id: string,
		claimed_token_amount: string,
		total_vesting_amount: string
	) {
		this.id = id;
		this.type = type;
		this.beneficiary = beneficiary;
		this.start_time = start_time;
		this.end_time = end_time;
		this.time_cliff_list = time_cliff_list;
		this.is_frozen = is_frozen;
		this.token_id = token_id;
		this.claimed_token_amount = claimed_token_amount;
		this.total_vesting_amount = total_vesting_amount;
	}
}

export function vestingFromJSON(vesting_obj: JSON.Obj, token_id: string | null): Vesting {
	let vesting_type = vesting_obj.getString("vesting_type")!.valueOf();
	let vesting_data_obj = vesting_obj.getObj("data")!;
	let vesting_token_info_obj = vesting_data_obj.getObj("vesting_token_info")!;

	let id = vesting_data_obj.getString("id")!.valueOf();
	let start_time = vesting_type=="natural_time_linear_vesting" ? BigInt.fromString(vesting_data_obj.getString("start_time")!.valueOf()):null;
	let end_time = (vesting_type=="natural_time_linear_vesting") ? BigInt.fromString(vesting_data_obj.getString("end_time")!.valueOf()):null;
	let time_cliff_list: string|null = (vesting_type=="natural_time_linear_vesting") ? null:vesting_data_obj.get("time_cliff_list")!.stringify();


	let vesting =  Vesting.load(id);
	if(!vesting) {
		vesting = new Vesting(id);
		vesting.is_terminated = false
		vesting.is_finish = false
	}
	vesting.type= vesting_obj.getString("vesting_type")!.valueOf();

	vesting.beneficiary = vesting_data_obj.getString("beneficiary")!.valueOf();
	vesting.start_time = start_time;
	vesting.end_time = end_time;
	vesting.time_cliff_list = time_cliff_list;
	vesting.is_frozen = vesting_data_obj.getBool("is_frozen")!.stringify() == "true";
	vesting.token_id =token_id?token_id:vesting.token_id
	vesting.claimed_token_amount =vesting_token_info_obj.getString("claimed_token_amount")!.valueOf();
	vesting.total_vesting_amount =vesting_token_info_obj.getString("total_vesting_amount")!.valueOf();
	vesting.create_time = BigInt.fromString(vesting_data_obj.getString("create_time")!.valueOf());
	return vesting;
}

