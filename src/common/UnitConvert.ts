export enum UnitSystem {
    Metric,
    Imperial,
};

export function getUnitSystemName(unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return "Metric";
        case UnitSystem.Imperial:
            return "Imperial";
    }
}

export function wTo(value: number/* unit: W */, unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return value / 1000;// unit: kW
        case UnitSystem.Imperial:
            return value / 745.699872;// unit: hp
    }
}

export function getPowerUnit(unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return "kW";
        case UnitSystem.Imperial:
            return "HP";
    }
}

export function nmTo(value: number/* unit: N/m */, unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return value;// unit: N/m
        case UnitSystem.Imperial:
            return value * 0.73756;// unit: lb/ft
    }
}

export function getTorqueUnit(unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return "N/M";
        case UnitSystem.Imperial:
            return "LB/FT";
    }
}

export function msTo(value: number/* unit: m/s */, unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Metric:
            return value * 3.6; // unit: KM/H
        case UnitSystem.Imperial:
            return value * 2.23694; // unit: MPH
    }
}

export function getSpeedUnit(unit: UnitSystem) {
    switch (unit) {
        case UnitSystem.Imperial:
            return "MPH";
        default:
            return "KM/H";
    }
}
