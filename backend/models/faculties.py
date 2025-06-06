from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Annotated


class FacultyQueryFilters(BaseModel):
    page: int = 1
    university: Optional[str] = ""
    faculty: Optional[str] = ""
    year: Optional[Annotated[int, Literal[2021, 2022, 2023, 2024]]] = Field(
        default=None,
        description="Year can be 2021–2024"
    )


class FacultyItem(BaseModel):
    """
    Defines the shape of a single faculty item in the response list.
    """
    year: int
    faculty_id: str
    faculty_name: str
    university_id: str
    university_name: str
    subjects: List[str]


class PaginatedFacultyResponse(BaseModel):
    items: List[FacultyItem]
    total: int
    limit: int
