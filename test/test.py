import socket
import csv
import time
import struct
from os import path

udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp.bind(("", 0))
udp.connect(("127.0.0.1", 5300))

bool_type = 0
u32 = 1
f32 = 2
i32 = 3
u16 = 4
u8 = 5
i8 = 6
data_type_map = [
    bool_type,  # is_race_on:
    u32,  # timestamp_ms: // Can overflow to 0 eventually
    f32,  # engine_max_rpm:
    f32,  # engine_idle_rpm:
    f32,  # current_engine_rpm:
    f32,  # acceleration_x: // In the car's local space; X = right, Y = up, Z = forward
    f32,  # acceleration_y:
    f32,  # acceleration_z:
    f32,  # velocity_x: // In the car's local space; X = right, Y = up, Z = forward
    f32,  # velocity_y:
    f32,  # velocity_z:
    f32,  # angular_velocity_x: // In the car's local space; X = pitch, Y = yaw, Z = roll
    f32,  # angular_velocity_y:
    f32,  # angular_velocity_z:
    f32,  # yaw:
    f32,  # pitch:
    f32,  # roll:
    f32,  # normalized_suspension_travel_front_left: // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
    f32,  # normalized_suspension_travel_front_right:
    f32,  # normalized_suspension_travel_rear_left:
    f32,  # normalized_suspension_travel_rear_right:
    f32,  # tire_slip_ratio_front_left: // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
    f32,  # tire_slip_ratio_front_right:
    f32,  # tire_slip_ratio_rear_left:
    f32,  # tire_slip_ratio_rear_right:
    f32,  # wheel_rotation_speed_front_left: // Wheel rotation speed radians/sec.
    f32,  # wheel_rotation_speed_front_right:
    f32,  # wheel_rotation_speed_rear_left:
    f32,  # wheel_rotation_speed_rear_right:
    f32,  # wheel_on_rumble_strip_front_left: // = 1 when wheel is on rumble strip, = 0 when off.
    f32,  # wheel_on_rumble_strip_front_right:
    f32,  # wheel_on_rumble_strip_rear_left:
    f32,  # wheel_on_rumble_strip_rear_right:
    f32,  # wheel_in_puddle_depth_front_left: // = from 0 to 1, where 1 is the deepest puddle
    f32,  # wheel_in_puddle_depth_front_right:
    f32,  # wheel_in_puddle_depth_rear_left:
    f32,  # wheel_in_puddle_depth_rear_right:
    f32,  # surface_rumble_front_left: // Non-dimensional surface rumble values passed to controller force feedback
    f32,  # surface_rumble_front_right:
    f32,  # surface_rumble_rear_left:
    f32,  # surface_rumble_rear_right:
    f32,  # tire_slip_angle_front_left: // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
    f32,  # tire_slip_angle_front_right:
    f32,  # tire_slip_angle_rear_left:
    f32,  # tire_slip_angle_rear_right:
    f32,  # tire_combined_slip_front_left: // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
    f32,  # tire_combined_slip_front_right:
    f32,  # tire_combined_slip_rear_left:
    f32,  # tire_combined_slip_rear_right:
    f32,  # suspension_travel_meters_front_left: // Actual suspension travel in meters
    f32,  # suspension_travel_meters_front_right:
    f32,  # suspension_travel_meters_rear_left:
    f32,  # suspension_travel_meters_rear_right:
    i32,  # car_ordinal:           // Unique ID of the car make/model
    i32,  # car_class: // Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive
    i32,  # car_performance_index: // Between 100 (slowest car) and 999 (fastest car) inclusive
    i32,  # drivetrain_type: // Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
    i32,  # num_cylinders: // Number of cylinders in the engine
    f32,  # position_x:
    f32,  # position_y:
    f32,  # position_z:
    f32,  # speed:
    f32,  # power:
    f32,  # torque:
    f32,  # tire_temp_fl:
    f32,  # tire_temp_fr:
    f32,  # tire_temp_rl:
    f32,  # tire_temp_rr:
    f32,  # boost:
    f32,  # fuel:
    f32,  # distance:
    f32,  # best_lap_time:
    f32,  # last_lap_time:
    f32,  # current_lap_time:
    f32,  # current_race_time:
    u16,  # lap:
    u8,  # race_position:
    u8,  # accelerator:
    u8,  # brake:
    u8,  # clutch:
    u8,  # handbrake:
    u8,  # gear:
    i8,  # steer:
    u8,  # normal_driving_line:
    u8,  # normal_ai_brake_difference:
]

data_length = 0
for data_type in data_type_map:
    if data_type == bool_type:
        data_length += 4
    elif data_type == u32:
        data_length += 4
    elif data_type == f32:
        data_length += 4
    elif data_type == i32:
        data_length += 4
    elif data_type == u16:
        data_length += 2
    elif data_type == u8:
        data_length += 1
    elif data_type == i8:
        data_length += 1
assert data_length == 311


def row_to_raw_data(row: list) -> bytes:
    b = []
    for [index, data] in enumerate(row):
        data_type = data_type_map[index]
        if data_type == bool_type:
            b.extend((1).to_bytes(4, "little", signed=False))
        elif data_type == u32:
            b.extend(int(data).to_bytes(4, "little", signed=False))
        elif data_type == f32:
            b.extend(struct.pack("<f", float(data)))
        elif data_type == i32:
            b.extend(int(data).to_bytes(4, "little", signed=True))
        elif data_type == u16:
            b.extend(int(data).to_bytes(2, "little", signed=False))
        elif data_type == u8:
            b.extend(int(data).to_bytes(1, "little", signed=False))
        elif data_type == i8:
            b.extend(int(data).to_bytes(1, "little", signed=True))
    assert len(b) == data_length
    return bytes(b)


data_file = path.join(path.dirname(path.abspath(__file__)), "top_gear.csv")

with open(data_file, mode="r") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",")
    next(spamreader)
    send_count = 0
    for row in spamreader:
        udp.send(row_to_raw_data(row))
        send_count += 1
        time.sleep(0.0167)

    print(f"Send Count: {send_count}")
