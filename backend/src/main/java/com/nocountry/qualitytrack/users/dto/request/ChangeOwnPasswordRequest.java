package com.nocountry.qualitytrack.users.dto.request;

public record ChangeOwnPasswordRequest(String currentValue, String newValue) {
}
