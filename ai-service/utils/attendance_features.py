def build_attendance_feature(stats):

    if not stats:
        return 0

    attendance_values = []

    for s in stats:

        if s["estado_asistencia"] == "presente":
            attendance_values.append(1)

        elif s["estado_asistencia"] == "tarde":
            attendance_values.append(0.7)

        elif s["estado_asistencia"] == "excusado":
            attendance_values.append(0.4)

        else:
            attendance_values.append(0)

    attendance_ratio = sum(attendance_values) / len(attendance_values)

    return attendance_ratio