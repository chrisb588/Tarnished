from pydantic_extra_types.phone_numbers import PhoneNumber


class PhPhone(PhoneNumber):
    """
    Custom phone number attribute for automatic Philippine phone number validation
    """

    default_region_code = "PH"
    supported_regions = ["PH"]
    phone_format = "E164"
